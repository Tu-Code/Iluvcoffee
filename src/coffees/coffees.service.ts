import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { findSourceMap } from 'module';
import { Connection, Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { COFFEE_BRANDS } from './coffees.constants';
import coffeesConfig from './config/coffees.config';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
    constructor(
        @InjectModel(Coffee.name)
        private readonly coffeeModel: Model<Coffee>,
        @InjectConnection()
        private readonly connection: Connection,
        @InjectModel(Event.name) 
        private readonly eventModel: Model<Event>,
        @Inject(coffeesConfig.KEY)
        private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    ){
        console.log(coffeesConfiguration.foo)
    }

    findAll(paginationQuery: PaginationQueryDto){
        const { limit, offset } = paginationQuery;
        return this.coffeeModel.find().skip(offset).limit(limit).exec();
    }
    
    findOne(id: string){
        const coffee = this.coffeeModel.findOne({ _id: id}).exec();
        if (!coffee){
            throw new NotFoundException(`Coffee #${id} not found`)
        }
        return coffee;
    }

    create(createCoffeeDto: CreateCoffeeDto){
        const coffee = new this.coffeeModel(createCoffeeDto);
        return coffee.save();
    }

    async update(id: string, updateCoffeeDto: any){
        const existingCoffee = await this.coffeeModel
            .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
            .exec()

        if (!existingCoffee){
            throw new NotFoundException(`Cofee ${id} not found`);
        }
        return existingCoffee;
    }

    async remove(id: string){
        const coffee = await this.findOne(id);
        return coffee.remove();
    }

    async recommendCoffee(coffee: Coffee){
        const session = await this.connection.startSession();
        session.startTransaction;

        try{
            coffee.recommendations++;
            
            const recommendEvent = new this.eventModel({
                name: 'recommend_cofee',
                type: 'coffee',
                payload: { coffeeId: coffee.id },
            });

            await recommendEvent.save({ session });
            await coffee.save({ session });

            await session.commitTransaction();
        } catch (err){
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
    }
}

