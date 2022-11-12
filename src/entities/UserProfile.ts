import { Column, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { JoinCamelColumn } from '../decorators/JoinCamelColumn';
import { User } from "./User";

@Entity("user_profiles")
export class UserProfile {
  /** The ID of the user */
  @PrimaryColumn()
  userId: number;

  /** The first name of the user  */
  @Column("varchar", { length: 100 })
  firstName: string;

  /** The Last name of the user*/
  @Column("varchar", { length: 100 })
  lastName: string;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToOne(type => User, u => u.profile, { onDelete: 'CASCADE' })
  @JoinCamelColumn('userId')
  user: User;
}