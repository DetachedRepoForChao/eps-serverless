import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsStoreHeaderComponent } from './points-store-header.component';

describe('PointsStoreHeaderComponent', () => {
  let component: PointsStoreHeaderComponent;
  let fixture: ComponentFixture<PointsStoreHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointsStoreHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointsStoreHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
