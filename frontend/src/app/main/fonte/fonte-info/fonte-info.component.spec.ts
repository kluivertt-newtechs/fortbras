import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FonteInfoComponent } from './fonte-info.component';

describe('FonteInfoComponent', () => {
  let component: FonteInfoComponent;
  let fixture: ComponentFixture<FonteInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FonteInfoComponent]
    });
    fixture = TestBed.createComponent(FonteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
