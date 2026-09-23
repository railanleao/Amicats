import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';

import {CatService} from '../../services/resources/cat.service';
import {CatAvatarComponent} from './cat-avatar.component';

describe('CatAvatarComponent', () => {
  let fixture: ComponentFixture<CatAvatarComponent>;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let createObjectUrl: jasmine.Spy;
  let revokeObjectUrl: jasmine.Spy;

  function setInputs(inputs: Record<string, unknown>): void {
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', ['photo']);
    createObjectUrl = spyOn(URL, 'createObjectURL').and.returnValues('blob:photo-1', 'blob:photo-2');
    revokeObjectUrl = spyOn(URL, 'revokeObjectURL');

    await TestBed.configureTestingModule({
      imports: [CatAvatarComponent],
      providers: [{provide: CatService, useValue: catServiceSpy}],
    }).compileComponents();

    fixture = TestBed.createComponent(CatAvatarComponent);
  });

  it('shows the initials when there is no photo and never requests one', () => {
    setInputs({name: 'Nina', catId: 7, hasPhoto: false});

    expect(fixture.nativeElement.textContent.trim()).toBe('N');
    expect(catServiceSpy.photo).not.toHaveBeenCalled();
  });

  it('uses a single initial for a single name and a question mark for an empty one', () => {
    setInputs({name: 'Nina'});
    expect(fixture.nativeElement.textContent.trim()).toBe('N');

    setInputs({name: '   '});
    expect(fixture.nativeElement.textContent.trim()).toBe('?');
  });

  it('requests the photo and shows it as an image', () => {
    catServiceSpy.photo.and.returnValue(of(new Blob(['x'])));

    setInputs({name: 'Nina', catId: 7, hasPhoto: true});

    expect(catServiceSpy.photo).toHaveBeenCalledWith(7);
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('blob:photo-1');
  });

  it('reloads the photo when the version changes and releases the previous one', () => {
    catServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({name: 'Nina', catId: 7, hasPhoto: true, version: 0});

    setInputs({version: 1});

    expect(catServiceSpy.photo).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo-1');
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:photo-2');
  });

  it('does not reload the photo when only the name changes', () => {
    catServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({name: 'Nin', catId: 7, hasPhoto: true});

    setInputs({name: 'Nina'});

    expect(catServiceSpy.photo).toHaveBeenCalledTimes(1);
  });

  it('falls back to the initials when the photo cannot be loaded', () => {
    catServiceSpy.photo.and.returnValue(throwError(() => new Error('not found')));

    setInputs({name: 'Nina', catId: 7, hasPhoto: true});

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('N');
  });

  it('releases the image URL when destroyed', () => {
    catServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({name: 'Nina', catId: 7, hasPhoto: true});

    fixture.destroy();

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo-1');
  });

  it('shows the preview instead of requesting a photo when a preview is given', () => {
    setInputs({name: 'Nina', previewUrl: 'blob:preview'});

    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:preview');
    expect(catServiceSpy.photo).not.toHaveBeenCalled();
  });
});
