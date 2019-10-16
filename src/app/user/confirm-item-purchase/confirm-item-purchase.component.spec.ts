import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmItemPurchaseComponent } from './confirm-item-purchase.component';

describe('ConfirmItemPurchaseComponent', () => {
  let component: ConfirmItemPurchaseComponent;
  let fixture: ComponentFixture<ConfirmItemPurchaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmItemPurchaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmItemPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
