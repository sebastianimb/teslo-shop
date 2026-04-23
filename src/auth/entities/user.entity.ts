import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({
    example: '0b5a2dd3-eba7-4deb-b6f2-f31c8e08082a',
    description: 'User ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'sebastian@email.com',
    description: 'User E-mail',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  email: string;

  @ApiProperty({
    description: 'User password',
    uniqueItems: true,
  })
  @Column('text', { select: false })
  password: string;

  @ApiProperty({
    example: 'Sebastian Molina',
    description: 'User full name',
  })
  @Column('text')
  fullName: string;

  @ApiProperty({
    example: true,
    description: 'User is active or not',
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: ['admin', 'super-user', 'user'],
    description: 'User roles',
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLocaleLowerCase().trim();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
