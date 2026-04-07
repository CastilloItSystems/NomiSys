// backend/src/shared/interfaces/IService.ts

export interface IService<T, CreateDTO, UpdateDTO = Partial<CreateDTO>> {
  getAll(filter?: Partial<T>): Promise<T[]>
  getById(id: string): Promise<T>
  create(data: CreateDTO): Promise<T>
  update(id: string, data: UpdateDTO): Promise<T>
  delete(id: string): Promise<void>
}
