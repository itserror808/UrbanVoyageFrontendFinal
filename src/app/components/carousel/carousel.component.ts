import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

interface Slide {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef;

  slides: Slide[] = [
    {
      image: "https://images.unsplash.com/photo-1589306719793-0a78d2744e7b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Marrakech",
      description: "Explore the vibrant souks, stunning palaces, and lively Djemaa el-Fna square in the Red City."
    },
    {
      image: "https://images.unsplash.com/photo-1701676639172-421b5e0b148b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Chefchaouen",
      description: "Wander through the enchanting blue-washed streets of this picturesque mountain town."
    },
    {
      image: "https://images.unsplash.com/photo-1559925523-10de9e23cf90?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Fes",
      description: "Discover the ancient medina, traditional tanneries, and rich cultural heritage of this imperial city."
    },
    {
      image: "https://images.unsplash.com/photo-1499617990088-691f028dd3ed?q=80&w=1933&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Dakhla",
      description: "Experience the perfect blend of desert and ocean, ideal for kitesurfing and enjoying pristine beaches."
    },
    {
      image: "https://images.unsplash.com/photo-1624802751971-d425380ee247?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Essaouira",
      description: "Enjoy the laid-back atmosphere, beautiful beaches, and historic medina of this coastal gem."
    }
  ];

  currentSlide = 0;
  intervalId: any;

  ngOnInit() {
    this.startCarousel();
  }

  ngAfterViewInit() {
    this.updateCarouselPosition();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  stopCarousel() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateCarouselPosition();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateCarouselPosition();
    this.stopCarousel();
    this.startCarousel();
  }

  updateCarouselPosition() {
    const trackElement = this.carouselTrack.nativeElement;
    const slideWidth = trackElement.clientWidth;
    trackElement.style.transform = `translateX(-${this.currentSlide * slideWidth}px)`;
  }
}
