import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointItemsCardComponent } from './point-items-card.component';

describe('PointItemsCardComponent', () => {
  let component: PointItemsCardComponent;
  let fixture: ComponentFixture<PointItemsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointItemsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointItemsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
