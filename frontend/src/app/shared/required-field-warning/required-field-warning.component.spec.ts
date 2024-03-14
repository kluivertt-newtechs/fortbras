import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredFieldWarningComponent } from './required-field-warning.component';

describe('RequiredFieldWarningComponent', () => {
  let component: RequiredFieldWarningComponent;
  let fixture: ComponentFixture<RequiredFieldWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequiredFieldWarningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequiredFieldWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
