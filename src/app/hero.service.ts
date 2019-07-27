import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class HeroService {
  /** URL to web api...Define the heroesUrl of the form :base/:collectionName with the address of the heroes
   resource on the server.Here base is the resource to which requests are made, and collectionName is the heroes
   data object in the in-memory-data-service.ts.*/

  private heroesUrl = 'api/heroes';

  /**The heroes web API expects a special header in HTTP save requests. That header is in the httpOptions
   *  constant defined in the HeroService. Add the following to the HeroService class. */
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  //get heroes from the server
  //tap() operator looks at the observable values, does something with those values, and passes them along
  //The tap() call back doesn't touch the values themselves.
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      )

  }

  /** GET a hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }



  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 *  Because each service method returns a different kind of Observable result,
 * handleError() takes a type parameter <T> so it can return the safe value as the type that the app expect
 */


  private handleError<T>(operation = 'operation', result?: T) {

    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };

  }

  /**PUT: update the hero on the server 
   * The HttpClient.put() method takes three parameters:the URL,
   *the data to update (the modified hero in this case), options 
  */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /**POST Add a new hero to the server
   addHero() differs from updateHero() in two ways: It calls HttpClient.post() instead of put().
   It expects the server to generate an id for the new hero, which it returns in the Observable<Hero> to the caller.
  */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server 
   * Note the following key points:deleteHero() calls HttpClient.delete().
   * The URL is the heroes resource URL plus the id of the hero to delete.
   * You don't send data as you did with put() and post().You still send the httpOptions.
  */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /*SEARCH GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }



}