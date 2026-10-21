
import { Component } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.page.html',
  styleUrls: ['./pokemon-list.page.scss'],
})
export class PokemonListPage {
  nombrePokemon = '';
  pokemon: any = null;
  loading = false;
  error = '';

  imagenes: string[] = [];
  imagenAnimada = '';
  audioPokemon: HTMLAudioElement | null = null;
  reproduciendo = false;

  nombreComparacion = '';
  pokemonComparacion: any = null;
  loadingComparacion = false;
  errorComparacion = '';

  constructor(private pokemonService: PokemonService) {}

  buscarPokemon() {
    const nombre = this.nombrePokemon.trim().toLowerCase();

    if (!nombre) {
      this.error = 'Escribe un nombre o número de Pokémon.';
      this.pokemon = null;
      return;
    }

    this.loading = true;
    this.error = '';
    this.pokemon = null;
    this.imagenes = [];
    this.imagenAnimada = '';
    this.detenerSonido();

    this.pokemonService.getPokemonDetails(nombre).subscribe({
      next: (respuesta: any) => {
        this.pokemon = respuesta;
        this.cargarImagenes(respuesta);
        this.loading = false;
      },
      error: () => {
        this.error = 'Pokémon no encontrado.';
        this.loading = false;
      },
    });
  }

  cargarImagenes(pokemon: any) {
    const sprites = pokemon.sprites;
    const oficiales = sprites.other?.['official-artwork'];
    const home = sprites.other?.home;
    const dreamWorld = sprites.other?.dream_world;
    const animated = sprites.versions?.['generation-v']?.['black-white']?.animated;

    this.imagenes = [...new Set([
      oficiales?.front_default,
      home?.front_default,
      sprites.front_default,
      sprites.back_default,
      sprites.front_shiny,
      sprites.back_shiny,
      dreamWorld?.front_default,
      animated?.front_default,
      animated?.back_default,
      animated?.front_shiny,
    ].filter((url): url is string => !!url))];

    this.imagenAnimada =
      animated?.front_default ||
      oficiales?.front_default ||
      sprites.front_default ||
      '';
  }

  reproducirSonido() {
    const sonido = this.pokemon?.cries?.latest || this.pokemon?.cries?.legacy;

    if (!sonido) {
      this.error = 'Sonido no disponible.';
      return;
    }

    this.detenerSonido();
    this.audioPokemon = new Audio(sonido);
    this.reproduciendo = true;

    this.audioPokemon.onended = () => this.reproduciendo = false;
    this.audioPokemon.onerror = () => {
      this.reproduciendo = false;
      this.error = 'No se pudo reproducir el sonido.';
    };

    this.audioPokemon.play().catch(() => {
      this.reproduciendo = false;
      this.error = 'No se pudo reproducir el sonido.';
    });
  }

  detenerSonido() {
    if (this.audioPokemon) {
      this.audioPokemon.pause();
      this.audioPokemon.currentTime = 0;
      this.audioPokemon = null;
    }

    this.reproduciendo = false;
  }

  buscarComparacion() {
    const nombre = this.nombreComparacion.trim().toLowerCase();

    if (!nombre) {
      this.errorComparacion = 'Escribe el segundo Pokémon.';
      this.pokemonComparacion = null;
      return;
    }

    this.loadingComparacion = true;
    this.errorComparacion = '';
    this.pokemonComparacion = null;

    this.pokemonService.getPokemonDetails(nombre).subscribe({
      next: (respuesta: any) => {
        this.pokemonComparacion = respuesta;
        this.loadingComparacion = false;
      },
      error: () => {
        this.errorComparacion = 'Pokémon no encontrado.';
        this.loadingComparacion = false;
      },
    });
  }

  limpiarComparacion() {
    this.nombreComparacion = '';
    this.pokemonComparacion = null;
    this.errorComparacion = '';
  }

  limpiarBusqueda() {
    this.detenerSonido();
    this.nombrePokemon = '';
    this.pokemon = null;
    this.imagenes = [];
    this.imagenAnimada = '';
    this.error = '';
  }
}
