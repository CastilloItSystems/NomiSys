// backend/src/shared/interfaces/IRepository.ts

export interface IRepository<T, CreateDTO, UpdateDTO = Partial<CreateDTO>> {
  findAll(filter?: Partial<T>): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDTO): Promise<T>
  update(id: string, data: UpdateDTO): Promise<T>
  delete(id: string): Promise<void>
}
