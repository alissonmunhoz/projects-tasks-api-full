import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import { Project } from './Project';

@Table({ tableName: 'repos', timestamps: true })
export class Repo extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) id!: string;

  @ForeignKey(() => Project) @AllowNull(false) @Column(DataType.UUID) projectId!: string;
  @BelongsTo(() => Project) project!: Project;

  @AllowNull(false) @Column(DataType.STRING) name!: string;
  @AllowNull(false) @Unique @Column(DataType.STRING) htmlUrl!: string;

  @Column(DataType.TEXT) description?: string;
  @Column(DataType.STRING) language?: string;
  @Column(DataType.INTEGER) stargazersCount?: number;
  @Column(DataType.DATE) pushedAt?: Date;
}
