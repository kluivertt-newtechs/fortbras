import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FonteDetailComponent } from './fonte-detail.component';

describe('FonteDetailComponent', () => {
  let component: FonteDetailComponent;
  let fixture: ComponentFixture<FonteDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FonteDetailComponent]
    });
    fixture = TestBed.createComponent(FonteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
