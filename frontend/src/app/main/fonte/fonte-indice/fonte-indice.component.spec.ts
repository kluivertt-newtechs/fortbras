import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FonteIndiceComponent } from './fonte-indice.component';

describe('FonteIndiceComponent', () => {
  let component: FonteIndiceComponent;
  let fixture: ComponentFixture<FonteIndiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FonteIndiceComponent]
    });
    fixture = TestBed.createComponent(FonteIndiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
