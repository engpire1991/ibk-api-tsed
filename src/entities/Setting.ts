import { Column, Entity, PrimaryColumn } from 'typeorm';
import { SettingKeys } from '../constants/SettingKeys';

@Entity('settings')
export class Setting {
  /** The key of the setting */
  @PrimaryColumn('varchar', { length: 50 })
  key: SettingKeys;

  /** The value of the setting */
  @Column('text', { nullable: true })
  value: string;
}