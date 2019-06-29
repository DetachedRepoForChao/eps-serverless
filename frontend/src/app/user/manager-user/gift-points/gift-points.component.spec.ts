import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftPointsComponent } from './gift-points.component';

describe('GiftPointsComponent', () => {
  let component: GiftPointsComponent;
  let fixture: ComponentFixture<GiftPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GiftPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
