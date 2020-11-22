import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Video } from 'src/app/models/video.model';
import { LeaderboardService } from 'src/app/services/leaderboard.service';
import { LearningService } from 'src/app/services/learning.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './learning.page.html',
  styleUrls: ['./learning.page.scss'],
})
export class LearningPage implements OnInit {
  videos: Video[]

  constructor(private sanitizer: DomSanitizer, private learningService: LearningService){
  }

  ngOnInit() {
    this.videos = this.learningService.videos
  }
  
  sanitizeUrl(url:string){
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
