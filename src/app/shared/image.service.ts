import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {GALLERY_IMAGE} from 'ngx-image-gallery';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private imagesSource: BehaviorSubject<GALLERY_IMAGE[]> = new BehaviorSubject([]);
  public images = this.imagesSource.asObservable();

  public setImages(value: GALLERY_IMAGE[]) {
    this.imagesSource.next(value);
  }

  constructor(private http: HttpClient) { }

  getImage(imageUrl: string): Observable<Blob> {
    // console.log('imageService getImage: imageUrl:');
    // console.log(imageUrl);
    return this.http.get(imageUrl, { responseType: 'blob' });
  }




}
