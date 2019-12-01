import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherUserManagerComponent } from './other-user-manager.component';

describe('OtherUserManagerComponent', () => {
  let component: OtherUserManagerComponent;
  let fixture: ComponentFixture<OtherUserManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherUserManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherUserManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
