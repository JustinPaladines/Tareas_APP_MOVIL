import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  // Obtener la lista de Pokémon
  getPokemons(limit: number = 5, offset: number = 0): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

  // Obtener detalles de un Pokémon por nombre o ID (limpiando espacios y convirtiendo a minúsculas)
  getPokemonDetails(nameOrId: string): Observable<any> {
    const formattedQuery = nameOrId.toLowerCase().trim();
    return this.http.get(`${this.apiUrl}/pokemon/${formattedQuery}`);
  }
}