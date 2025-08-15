import { Table, Column, Model, DataType, PrimaryKey, Default, Unique, AllowNull, HasMany } from 'sequelize-typescript';
import { Project } from './Project';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) id!: string;
  @AllowNull(false) @Column(DataType.STRING) name!: string;
  @Unique @AllowNull(false) @Column(DataType.STRING) email!: string;
  @AllowNull(false) @Column(DataType.STRING) passwordHash!: string;
  @HasMany(() => Project) projects!: Project[];
}
