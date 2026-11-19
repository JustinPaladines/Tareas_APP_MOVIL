import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatGrupoPage } from './chat-grupo.page';

describe('ChatGrupoPage', () => {
  let component: ChatGrupoPage;
  let fixture: ComponentFixture<ChatGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
