import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicionarioComponent } from './dicionario.component';

describe('DicionarioComponent', () => {
  let component: DicionarioComponent;
  let fixture: ComponentFixture<DicionarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DicionarioComponent]
    });
    fixture = TestBed.createComponent(DicionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
