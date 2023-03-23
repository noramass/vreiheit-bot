import { Server } from "src/entities/server";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("translation")
export class Translation {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column("varchar")
  key!: string;

  @Column("varchar")
  lang!: string;

  @Column("varchar")
  text!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Server, ({ blockedTerms }) => blockedTerms)
  guild!: Server;
}
