export const FACET_CONFIG = [
  {
    id: 'sort',
    label: 'SORT BY',
    type: 'radio',
    defaultOpen: true,
    options: [
      { label: 'Recommended', value: 'recommended' },
      { label: 'Name (A-Z)', value: 'name_asc' },
      { label: 'Name (Z-A)', value: 'name_desc' },
    ],
  },
  {
    id: 'category',
    label: 'CATEGORY',
    type: 'checkbox',
    defaultOpen: true,
    options: ['Pendants', 'Necklaces', 'Rings', 'Earrings', 'Bracelets'],
  },
  {
    id: 'metal',
    label: 'METAL',
    type: 'checkbox',
    defaultOpen: false,
    options: ['Rose gold', 'Yellow gold', 'White gold'],
  },
  {
    id: 'novelties',
    label: 'NOVELTIES',
    type: 'checkbox',
    defaultOpen: false,
    options: ['Yes'],
  },
  {
    id: 'gender',
    label: 'GENDER',
    type: 'checkbox',
    defaultOpen: false,
    options: ['Women', 'Unisex'],
  },
  {
    id: 'shape',
    label: 'SHAPE',
    type: 'checkbox',
    defaultOpen: false,
    options: ['Square'],
  },
]
