export type ReservationTimes = {
  [day in 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday']?: [
    string,
    string,
  ][]
}

export interface Response {
  data: Branch[]
  links: {
    first: string | null
    last: string | null
    next: string | null
    prev: string | null
  }
  meta: {
    current_page: number
    from: number
    path: string
    per_page: number
    to: number
  }
}

export interface Table {
  id: string
  section_id: string
  name: string
  status: number
  seats: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  accepts_reservations: boolean
}

export interface Section {
  id: string
  branch_id: string
  name: string
  name_localized: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  tables: Table[]
}

export interface Branch {
  id: string
  name: string
  name_localized: string | null
  reference: string
  type: number
  latitude: string | null
  longitude: string | null
  phone: string | null
  opening_from: string
  opening_to: string
  inventory_end_of_day_time: string
  receipt_header: string | null
  receipt_footer: string | null
  settings: unknown | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  receives_online_orders: boolean
  accepts_reservations: boolean
  reservation_duration: number
  reservation_times: ReservationTimes
  address: string | null
  sections: Section[]
  numberOfTables?: number
}

export interface TableOption {
  id: string
  section_name: string
  table_name: string
}

export interface BranchForm {
  reservation_duration: number
  table_ids: string[]
  reservation_times: Record<string, [string, string][]>
}
