import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, 
  IonButton, IonList, IonLabel, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonSelect, IonSelectOption, 
  IonRadioGroup, IonRadio, IonDatetime, IonDatetimeButton, 
  IonModal, IonSegment, IonSegmentButton, IonCheckbox, IonTextarea,
  IonButtons, IonListHeader
} from '@ionic/angular/standalone';
import { FirebaseService, Candidato } from '../services/firebase.service';

@Component({
  selector: 'app-home', 
  standalone: true, 
  templateUrl: './home.page.html', 
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, 
    IonButton, IonList, IonLabel, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonSelect, IonSelectOption, 
    IonRadioGroup, IonRadio, IonDatetime, IonDatetimeButton, 
    IonModal, IonSegment, IonSegmentButton, IonCheckbox, IonTextarea,
    IonButtons, IonListHeader
  ]
})
export class HomePage implements OnInit {
  private firebase = inject(FirebaseService);
  private fb = inject(FormBuilder);

  // Formulario reactivo ajustado para evitar bloqueos inesperados
  formulario: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(10)]],
    fechaNacimiento: ['', Validators.required],
    cargo: ['', Validators.required],
    nivelAcademico: ['', Validators.required],
    experienciaAnios: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
    modalidad: ['', Validators.required],
    habilidades: [[], Validators.required], // Asegúrate de seleccionar al menos una habilidad en el ion-select
    fechaDisponibilidad: ['', Validators.required],
    aspiracionSalarial: [null, [Validators.required, Validators.min(1)]],
    resumen: ['', [Validators.required, Validators.minLength(30)]], // Recuerda que pide mínimo 30 caracteres
    consentimiento: [false, Validators.requiredTrue] // Debe estar chequeado
  });

  candidatos: (Candidato & { id: string })[] = [];
  guardando = false;
  mensaje = '';

  // Variables para controlar el Modal de Detalle
  candidatoSeleccionado: (Candidato & { id: string }) | null = null;
  modalAbierto = false;
  
  fechaHoy: string = new Date().toISOString().split('T')[0];

  async ngOnInit() { 
    await this.cargarCandidatos(); 
  }

  async guardar() {
    if (this.formulario.invalid) {
      this.mensaje = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    
    try {
      await this.firebase.guardarCandidato(this.formulario.value);
      this.formulario.reset(); 
      this.mensaje = 'Candidato guardado correctamente.';
      await this.cargarCandidatos();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudo guardar en Firestore.';
    } finally { 
      this.guardando = false; 
    }
  }

  async cargarCandidatos() {
    try { 
      this.candidatos = await this.firebase.obtenerCandidatos(); 
    } catch (error) { 
      console.error(error); 
      this.mensaje = 'No se pudo consultar Firestore.'; 
    }
  }

  // Métodos para abrir y cerrar el modal de detalle de cada candidato
  abrirDetalle(candidato: (Candidato & { id: string })) {
    this.candidatoSeleccionado = candidato;
    this.modalAbierto = true;
  }

  cerrarDetalle() {
    this.modalAbierto = false;
    this.candidatoSeleccionado = null;
  }
}