import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreItemsCardComponent } from './store-items-card.component';

describe('StoreItemsCardComponent', () => {
  let component: StoreItemsCardComponent;
  let fixture: ComponentFixture<StoreItemsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreItemsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreItemsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
