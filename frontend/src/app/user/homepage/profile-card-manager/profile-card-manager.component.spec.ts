import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCardManagerComponent } from './profile-card-manager.component';

describe('ProfileCardManagerComponent', () => {
  let component: ProfileCardManagerComponent;
  let fixture: ComponentFixture<ProfileCardManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileCardManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCardManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
