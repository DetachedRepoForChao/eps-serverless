import { TestBed } from '@angular/core/testing';

import { FeedcardService } from './feedcard.service';

describe('FeedcardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeedcardService = TestBed.get(FeedcardService);
    expect(service).toBeTruthy();
  });
});
