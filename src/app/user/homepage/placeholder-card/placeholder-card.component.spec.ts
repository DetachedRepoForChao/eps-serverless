import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderCardComponent } from './placeholder-card.component';

describe('PlaceholderCardComponent', () => {
  let component: PlaceholderCardComponent;
  let fixture: ComponentFixture<PlaceholderCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
