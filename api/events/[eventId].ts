import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UpdateBudgetPayload } from '../../src/types/budget.js';
import type { CreateEventPayload, Event } from '../../src/types/event.js';
import {
  readChecklistItems,
  writeChecklistItems,
} from '../_lib/checklist-store.js';
import {
  readBudgets,
  readContacts,
  readEvents,
  writeBudgets,
  writeContacts,
  writeEvents,
} from '../_lib/mock-store.js';
import {
  readParticipants,
  writeParticipants,
} from '../_lib/participant-store.js';
import {
  readPreferenceFields,
  writePreferenceFields,
} from '../_lib/preference-field-store.js';
import { supabase } from '../_lib/supabase.js';
import { readTriggers } from '../_lib/trigger-store.js';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string };

  if (req.method === 'GET') {
    if (USE_MOCK) {
      const event = readEvents().find((e) => e.id === eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      const participants = readParticipants().filter(
        (p) => p.event_id === eventId,
      );
      const checklist = readChecklistItems().filter(
        (item) => item.event_id === eventId,
      );
      const triggers = readTriggers().filter((t) => t.eventId === eventId);
      const budget = readBudgets().find((b) => b.event_id === eventId) ?? null;
      const preference_fields = readPreferenceFields().filter(
        (f) => f.event_id === eventId,
      );
      const contacts = readContacts().filter((c) => c.event_id === eventId);
      return res.status(200).json({
        ...event,
        participants,
        checklist,
        triggers,
        budget,
        preference_fields,
        contacts,
      });
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (error || !event)
      return res.status(404).json({ message: 'Event not found' });

    const [
      { data: participants },
      { data: checklist },
      { data: preference_fields },
      { data: contacts },
      { data: budget },
      { data: dbTriggers },
    ] = await Promise.all([
      supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('full_name', { ascending: true }),
      supabase
        .from('checklist_items')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('preference_fields')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true }),
      supabase.from('contacts').select('*').eq('event_id', eventId),
      supabase
        .from('budget_config')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle(),
      supabase.from('triggers').select('*').eq('event_id', eventId),
    ]);

    // Transform DB trigger format → frontend Trigger shape
    const triggers = (dbTriggers ?? []).map((t: Record<string, unknown>) => {
      const name =
        t.source === 'checklist_item'
          ? (((checklist ?? []) as Record<string, unknown>[]).find(
              (ci) => ci.id === t.checklist_item_id,
            )?.label ?? '')
          : t.milestone_type === 'rsvp_50'
            ? 'RSVP hits 50%'
            : 'Event ended';
      return {
        id: t.id,
        eventId: t.event_id,
        name,
        source: t.source === 'checklist_item' ? 'checklist' : 'milestone',
        timing: t.timing_type,
        timingValue: t.timing_value ?? 0,
        channel: t.channel,
        recipient: t.recipient,
      };
    });

    return res.status(200).json({
      ...event,
      participants: participants ?? [],
      checklist: checklist ?? [],
      preference_fields: preference_fields ?? [],
      contacts: contacts ?? [],
      budget: budget ?? null,
      triggers,
    });
  }

  if (req.method === 'PUT') {
    const body = req.body as Partial<CreateEventPayload>;

    if (!body.title?.trim())
      return res.status(400).json({ message: 'title is required' });
    if (!body.description?.trim())
      return res.status(400).json({ message: 'description is required' });
    if (!body.event_type)
      return res.status(400).json({ message: 'event_type is required' });
    if (!body.date_start?.trim())
      return res.status(400).json({ message: 'date_start is required' });

    if (USE_MOCK) {
      const all = readEvents();
      const index = all.findIndex((e) => e.id === eventId);
      if (index === -1)
        return res.status(404).json({ message: 'Event not found' });

      const now = new Date().toISOString();
      const updated: Event = {
        ...all[index],
        title: body.title,
        description: body.description,
        event_type: body.event_type,
        date_start: body.date_start,
        date_end: body.date_end ?? null,
        location: body.location ?? null,
        expected_attendees: body.expected_attendees ?? null,
        event_day_info: body.event_day_info ?? null,
        modules: {
          participantList:
            body.modules?.participantList ?? all[index].modules.participantList,
          checklist: body.modules?.checklist ?? all[index].modules.checklist,
          budget: body.modules?.budget ?? all[index].modules.budget,
          notifications:
            body.modules?.notifications ?? all[index].modules.notifications,
          contacts: body.modules?.contacts ?? all[index].modules.contacts,
        },
        updated_at: now,
      };
      all[index] = updated;
      writeEvents(all);

      const otherParticipants = readParticipants().filter(
        (p) => p.event_id !== eventId,
      );
      const newParticipants =
        updated.modules.participantList && body.participants?.length
          ? body.participants.map((p, i) => ({
              id: generateId('part'),
              event_id: eventId,
              email: p.email.trim(),
              full_name: '',
              google_uid: null,
              location_city: null,
              location_region: null,
              location_country: null,
              rsvp_status: 'pending' as const,
              created_at: now,
              updated_at: now,
              sort_order: i,
            }))
          : [];
      writeParticipants([...otherParticipants, ...newParticipants]);

      const otherItems = readChecklistItems().filter(
        (i) => i.event_id !== eventId,
      );
      const newItems =
        updated.modules.checklist && body.checklist?.length
          ? body.checklist.map((item, i) => ({
              id: generateId('item'),
              event_id: eventId,
              label: item.label,
              item_type: item.item_type,
              required: item.required,
              alert_if_incomplete: item.alert_if_incomplete,
              sort_order: i,
            }))
          : [];
      writeChecklistItems([...otherItems, ...newItems]);

      const otherFields = readPreferenceFields().filter(
        (f) => f.event_id !== eventId,
      );
      const newFields =
        updated.modules.participantList && body.preferenceFields?.length
          ? body.preferenceFields.map((field, i) => ({
              id: generateId('pref'),
              event_id: eventId,
              label: field.label,
              field_type: field.field_type,
              options: field.options ?? null,
              required: field.required,
              sort_order: i,
            }))
          : [];
      writePreferenceFields([...otherFields, ...newFields]);

      return res.status(200).json(updated);
    }

    // ── Supabase path ──────────────────────────────────────────────────────────
    const modules = {
      participantList: body.modules?.participantList ?? true,
      checklist: body.modules?.checklist ?? true,
      budget: body.modules?.budget ?? false,
      notifications: body.modules?.notifications ?? true,
      contacts: body.modules?.contacts ?? false,
    };

    const { data: updated, error } = await supabase
      .from('events')
      .update({
        title: body.title,
        description: body.description,
        event_type: body.event_type,
        date_start: body.date_start,
        date_end: body.date_end ?? null,
        location: body.location ?? null,
        expected_attendees: body.expected_attendees ?? null,
        event_day_info: body.event_day_info ?? null,
        modules,
      })
      .eq('id', eventId)
      .select()
      .single();
    if (error || !updated)
      return res
        .status(error ? 500 : 404)
        .json({ message: error?.message ?? 'Event not found' });

    if (modules.participantList) {
      await supabase.from('participants').delete().eq('event_id', eventId);
      if (body.participants?.length) {
        await supabase.from('participants').insert(
          body.participants.map((p, i) => ({
            event_id: eventId,
            email: p.email.trim(),
            full_name: '',
            rsvp_status: 'pending',
            sort_order: i,
          })),
        );
      }
      await supabase.from('preference_fields').delete().eq('event_id', eventId);
      if (body.preferenceFields?.length) {
        await supabase.from('preference_fields').insert(
          body.preferenceFields.map((field, i) => ({
            event_id: eventId,
            label: field.label,
            field_type: field.field_type,
            options: field.options ?? null,
            required: field.required,
            sort_order: i,
          })),
        );
      }
    }

    if (modules.checklist) {
      await supabase.from('checklist_items').delete().eq('event_id', eventId);
      if (body.checklist?.length) {
        await supabase.from('checklist_items').insert(
          body.checklist.map((item, i) => ({
            event_id: eventId,
            label: item.label,
            item_type: item.item_type,
            required: item.required,
            alert_if_incomplete: item.alert_if_incomplete,
            sort_order: i,
          })),
        );
      }
    }

    return res.status(200).json(updated);
  }

  if (req.method === 'PATCH') {
    const { categories } = req.body as Partial<UpdateBudgetPayload>;
    if (!Array.isArray(categories))
      return res.status(400).json({ message: 'categories must be an array' });

    if (USE_MOCK) {
      const event = readEvents().find((e) => e.id === eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const budgets = readBudgets();
      const now = new Date().toISOString();
      const existing = budgets.find((b) => b.event_id === eventId);

      if (existing) {
        existing.categories = categories;
        existing.updated_at = now;
        writeBudgets(budgets);
        return res.status(200).json(existing);
      }

      const created = {
        event_id: eventId,
        currency: 'USD',
        categories,
        updated_at: now,
      };
      writeBudgets([...budgets, created]);
      return res.status(200).json(created);
    }

    // ── Supabase path ──────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('budget_config')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('budget_config')
        .update({ categories, updated_at: now })
        .eq('event_id', eventId)
        .select()
        .single();
      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data);
    }

    const { data: created, error } = await supabase
      .from('budget_config')
      .insert({
        event_id: eventId,
        currency: 'USD',
        categories,
        updated_at: now,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(created);
  }

  if (req.method === 'DELETE') {
    if (USE_MOCK) {
      const all = readEvents();
      const index = all.findIndex((e) => e.id === eventId);
      if (index === -1)
        return res.status(404).json({ message: 'Event not found' });

      writeEvents(all.filter((e) => e.id !== eventId));
      writeParticipants(
        readParticipants().filter((p) => p.event_id !== eventId),
      );
      writeChecklistItems(
        readChecklistItems().filter((i) => i.event_id !== eventId),
      );
      writePreferenceFields(
        readPreferenceFields().filter((f) => f.event_id !== eventId),
      );

      return res.status(204).end();
    }

    // ── Supabase path — cascade handles related rows ───────────────────────────
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(204).end();
  }

  return res.status(405).end();
}
