import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserSettingKeys } from '../constants/UserSettingKeys';
import { JoinCamelColumn } from '../decorators/JoinCamelColumn';
import { User } from './User';

@Entity('user_settings')
@Index(['userId', 'key'], { unique: true })
export class UserSetting {
  /** The ID of the user setting */
  @PrimaryGeneratedColumn()
  id: number;

  /** The ID of the user */
  @Column('int')
  userId: number;

  /** The key of the user setting */
  @Column('varchar')
  key: UserSettingKeys;

  /** The value of the user setting */
  @Column('varchar', { nullable: true })
  value: string;

  /** The date time when the user setting was created */
  @CreateDateColumn()
  createdDate: Date;

  /** The date time when the user setting was last upadted */
  @UpdateDateColumn()
  updatedDate: Date;

  
  @ManyToOne(type => User, { onDelete: 'CASCADE' })
  @JoinCamelColumn('userId')
  user: User;
}