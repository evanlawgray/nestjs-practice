import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import * as pactum from 'pactum';
import { EditUserDto } from "src/user/dto";
import { CreateBookmarkDto } from "src/bookmark/dto/create-bookmark.dto";
import { EditBookmarkDto } from "src/bookmark/dto/edit-bookmark.dto";


describe('app e2e test', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => app.close());


  describe('auth', () => {
    const dto = {
      email: 'evan@gmail.com',
      password: 'pass',
    };

    describe('signup', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({passoword: dto.password})
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({emails: dto.email})
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });

      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .inspect()
          .expectStatus(201);
      });
    });

    describe('signin', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({passoword: dto.password})
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({emails: dto.email})
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token')
      });
    });
  });

  describe('user', () => {
    describe('Get me', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('Should edit user', () => {
        const dto: EditUserDto = {
          email: 'evan@gmail.com',
          firstName: 'Evan',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .withBody(dto)
          .expectStatus(200)
          .inspect()
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });

  describe('bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should return empty collection', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      it('should create a bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'my bookmark',
          description: 'it\'s a bookarmk',
          link: 'google.com',
        };

        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get all bookmarks for user', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      it('should edit bookmark by id', () => {
        const dto: EditBookmarkDto = {
          title: 'new title',
          description: 'new description',
          link: 'newlink.com',
        };

        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum 
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({Authorization: 'Bearer $S{userAt}'})
          .expectStatus(204);
      });
    });
  });
});
