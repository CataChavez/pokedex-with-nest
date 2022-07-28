import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) { }
  
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon = Pokemon
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
    if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);

    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no ${term} not found`);
    }
    return pokemon;
    
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
  
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name;
    try {
      await this.pokemonModel.updateOne(updatePokemonDto);
      return {...pokemon, ...updatePokemonDto};
    } catch (error) {
      this.handleError(error);
    }
    
  }

  async remove(_id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id});
    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon with id "${_id}" not found`);
    return;
    
  }

  private handleError(error: any) { 
    if (error.code === 11000) {
      console.log(error);
      throw new BadRequestException(`Pokemon already exists in the database ${JSON.stringify(error.keyValue)}`);
    }
    throw new InternalServerErrorException('Error');
  }

}
