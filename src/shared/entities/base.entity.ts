import { CreateDateColumn, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @ObjectIdColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
