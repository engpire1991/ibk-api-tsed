import { EntityRepository } from "typeorm";
import { User } from "../entities/User";
import { RepositoryExtender } from "../extenders/RepositoryExtender";

@EntityRepository(User)
export class UserRepository extends RepositoryExtender<User> {
  
}