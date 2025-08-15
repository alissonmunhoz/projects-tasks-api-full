import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Task } from './Task';
import { Repo } from './Repo';

@Table({ tableName: 'projects', timestamps: true })
export class Project extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) id!: string;
  @AllowNull(false) @Column(DataType.STRING) name!: string;
  @Column(DataType.TEXT) description?: string;

  @ForeignKey(() => User) @AllowNull(false) @Column(DataType.UUID) userId!: string;
  @BelongsTo(() => User) user!: User;

  @HasMany(() => Task) tasks!: Task[];
  @HasMany(() => Repo) repos!: Repo[];
}
