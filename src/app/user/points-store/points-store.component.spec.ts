import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsStoreComponent } from './points-store.component';

describe('PointsStoreComponent', () => {
  let component: PointsStoreComponent;
  let fixture: ComponentFixture<PointsStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointsStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointsStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
