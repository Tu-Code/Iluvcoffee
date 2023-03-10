import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';
import { EventSchema } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import coffeesConfig from './config/coffees.config';
import { Coffee, CoffeeSchema } from './entities/coffee.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Coffee.name,
                schema: CoffeeSchema,
            },
            {
                name: Event.name,
                schema: EventSchema,
            },
        ]),
        ConfigModule.forFeature(coffeesConfig),
    ],
    controllers: [CoffeesController], 
    providers: [CoffeesService],
    exports: [CoffeesService],
})
export class CoffeesModule {}
