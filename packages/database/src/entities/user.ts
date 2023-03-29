import { ServerMember } from "src/entities/server-member";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("user")
export class User {
  @PrimaryColumn("varchar")
  id!: string;

  @Column("varchar")
  username!: string;

  @Column("varchar", { nullable: true })
  avatarUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => ServerMember, ({ user }) => user)
  members!: ServerMember[];
}
