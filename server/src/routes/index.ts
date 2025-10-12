import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import { MatchController } from '../controllers/matchController.js'
import { TestController } from '../controllers/testController.js'

const router = Router()

// User routes
router.get('/users/me', UserController.getMe)
router.put('/users/me', UserController.updateMe)
router.get('/users/stats', UserController.getUserStats)
router.get('/users/search', UserController.searchUsers)
router.get('/users/:userId', UserController.getUser)

// Match & Like routes
router.post('/matches/like', MatchController.likeUser)
router.get('/matches', MatchController.getMatches)
router.get('/matches/potential', MatchController.getPotentialMatches)
router.get('/matches/:matchId', MatchController.getMatchDetails)
router.get('/likes', MatchController.getLikes)

// Test routes
router.get('/test/questions', TestController.getQuestions)
router.get('/test/questions/:questionId', TestController.getQuestion)
router.post('/test/answer', TestController.submitAnswer)
router.post('/test/submit', TestController.submitTest)
router.get('/test/answers', TestController.getUserAnswers)
router.get('/test/progress', TestController.getProgress)
router.get('/test/score', TestController.getTestScore)
router.get('/test/compatibility/:userId', TestController.getCompatibility)

export { router as routes }
