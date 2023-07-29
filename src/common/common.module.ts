import { Global, Module } from '@nestjs/common';
import { PUB_SUB } from './common.constants';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: pubSub,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
