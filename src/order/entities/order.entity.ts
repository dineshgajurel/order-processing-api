import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OrderStatus } from '../../common/enums/common.enum';

// export enum OrderStatus {
//   PENDING = 'PENDING',
//   PROCESSING = 'PROCESSING',
//   COMPLETED = 'COMPLETED',
//   CANCELLED = 'CANCELLED',
// }

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  items: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
