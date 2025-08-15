import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Project } from './Project';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

@Table({ tableName: 'tasks', timestamps: true })
export class Task extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) id!: string;

  @AllowNull(false) @Column(DataType.STRING) title!: string;
  @Column(DataType.TEXT) description?: string;
  @AllowNull(false) @Column(DataType.ENUM('todo','in_progress','done')) status!: TaskStatus;

  @ForeignKey(() => Project) @AllowNull(false) @Column(DataType.UUID) projectId!: string;
  @BelongsTo(() => Project) project!: Project;
}
