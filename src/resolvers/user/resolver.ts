import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';
import { Resolver, Query, Arg, Mutation, InputType, Field } from 'type-graphql';

import User from '../../entities/User';

@InputType()
export class CreateUserInput implements Partial<User> {
  @Field()
  public name: string;

  @Field()
  public email: string;
}

@Service()
@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Query(() => User, { nullable: true })
  public async user(@Arg('id') id: string) {
    return this.userRepository.findOne({ id });
  }

  @Query(() => [User])
  public async users() {
    return this.userRepository.find();
  }

  @Mutation(() => User)
  public async createUser(@Arg('user') user: CreateUserInput) {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
}
