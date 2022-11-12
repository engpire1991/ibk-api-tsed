import * as crypto from 'crypto';
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserProfile } from './UserProfile';

@Entity('users')
export class User {
  /** The ID of the user */
  @PrimaryGeneratedColumn()
  id: number;

  /** The username of the user */
  @Column('varchar', { length: 10, unique: true })
  username: string;

  /** The password of the user */
  @Column("varchar", { length: 64, select: false })
  password: string;

  /** The salt used for hashing hte password */
  @Column("varchar", { length: 48, select: false })
  salt: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToOne(type => UserProfile, up => up.user, { eager: true })
  profile: UserProfile;


  @BeforeInsert()
  private beforeInsert() {
    this.salt = this.generateSalt();
    this.password = this.hashPassword(this.password, this.salt);
  }

  public verifyPassword(password: string): boolean {
    return this.password === this.hashPassword(password, this.salt);
  }

  public generateSalt(): string {
    return crypto.randomBytes(32).toString('hex').slice(0, 32);
  }

  public hashPassword(password: string | number, salt: string): string {
    if (typeof password != "string") password = String(password);
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

}