import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicionarioInfoComponent } from './dicionario-info.component';

describe('DicionarioInfoComponent', () => {
  let component: DicionarioInfoComponent;
  let fixture: ComponentFixture<DicionarioInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DicionarioInfoComponent]
    });
    fixture = TestBed.createComponent(DicionarioInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
