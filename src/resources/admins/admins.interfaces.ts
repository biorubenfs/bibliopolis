export interface Admin {
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}
export type NewAdminData = Admin

export interface DBAdmin extends Admin {
  _id: string
}
