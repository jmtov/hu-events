export const participants = [
  {
    id: 'b2c3d4e5-0002-0000-0000-000000000001',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    email: 'ana.garcia@company.com',
    full_name: 'Ana Garcia',
    google_uid: 'google-uid-001',
    location_city: 'Buenos Aires',
    location_region: 'Buenos Aires',
    location_country: 'Argentina',
    rsvp_status: 'confirmed',
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-06T09:00:00Z',
  },
  {
    id: 'b2c3d4e5-0002-0000-0000-000000000002',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    email: 'carlos.mendez@company.com',
    full_name: 'Carlos Mendez',
    google_uid: null,
    location_city: 'Bogota',
    location_region: 'Cundinamarca',
    location_country: 'Colombia',
    rsvp_status: 'pending',
    created_at: '2026-03-06T11:00:00Z',
    updated_at: '2026-03-06T11:00:00Z',
  },
  {
    id: 'b2c3d4e5-0002-0000-0000-000000000003',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    email: 'laura.silva@company.com',
    full_name: 'Laura Silva',
    google_uid: 'google-uid-003',
    location_city: 'Sao Paulo',
    location_region: 'Sao Paulo',
    location_country: 'Brazil',
    rsvp_status: 'confirmed',
    created_at: '2026-03-07T08:30:00Z',
    updated_at: '2026-03-08T14:00:00Z',
  },
<<<<<<< HEAD
];
=======
]
>>>>>>> 9ddbae8 (chore(infra): add supabase schema, fixtures, and env setup)

export const preferenceFields = [
  {
    id: 'c3d4e5f6-0003-0000-0000-000000000001',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    label: 'Dietary restrictions',
    field_type: 'text',
    options: null,
    required: false,
    sort_order: 0,
  },
  {
    id: 'c3d4e5f6-0003-0000-0000-000000000002',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    label: 'T-shirt size',
    field_type: 'select',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    required: false,
    sort_order: 1,
  },
<<<<<<< HEAD
];
=======
]
>>>>>>> 9ddbae8 (chore(infra): add supabase schema, fixtures, and env setup)

export const participantPreferences = [
  {
    id: 'd4e5f6a7-0004-0000-0000-000000000001',
    participant_id: 'b2c3d4e5-0002-0000-0000-000000000001',
    field_id: 'c3d4e5f6-0003-0000-0000-000000000001',
    value: 'Vegetarian',
  },
  {
    id: 'd4e5f6a7-0004-0000-0000-000000000002',
    participant_id: 'b2c3d4e5-0002-0000-0000-000000000001',
    field_id: 'c3d4e5f6-0003-0000-0000-000000000002',
    value: 'M',
  },
<<<<<<< HEAD
];
=======
]
>>>>>>> 9ddbae8 (chore(infra): add supabase schema, fixtures, and env setup)
