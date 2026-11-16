// local dependencies
import type { TimerKind } from "../theme";
import type { Tag, Unit, Recipe } from "../domain/recipe";
import type { AppLanguage } from "../i18n/resolveLanguage";

// ─── local template types ────────────────────────────────────────────────────

type Bilingual = { en: string; uk: string };

type IngredientDef = {
    id: string;
    name: Bilingual;
    amount?: number;
    unit: Unit;
};

type StepDef = {
    id: string;
    text: Bilingual;
    ingredientIds: string[];
    timer?: { minutes: number; kind: TimerKind };
};

type RecipeDef = {
    id: string;
    title: Bilingual;
    servings: number;
    totalMinutes?: number;
    caloriesPerServing?: number;
    tags: Tag[];
    favorite: boolean;
    ingredients: IngredientDef[];
    steps: StepDef[];
};

// ─── hard-coded RFC 4122 UUID v4 identifiers ─────────────────────────────────

// Borscht — recipe + 12 ingredients + 5 steps
const B_ID = "abceab32-2475-4ba0-b60b-9ecbe8c052dc";
const B_BEEF = "d949b982-0590-4ff9-a79f-cccf06d89e9c";
const B_WATER = "673f0b5c-132f-4535-ac90-d969b5d78418";
const B_BEET = "ad6d219d-0316-462f-a5ec-7a38eefb5d98";
const B_POTATO = "48c049aa-e21f-49fb-8fc3-0ebc0045f042";
const B_CABBAGE = "0477b912-1966-41c6-9672-ba80c86bfa32";
const B_CARROT = "1a065dc9-fc33-439f-b0b7-00e8fabd3d82";
const B_ONION = "df790c86-d3b9-4075-bb7b-9698bfa8d7d8";
const B_TOMPASTE = "d89b3756-4b9f-403b-87eb-0f794e4f43a4";
const B_OIL = "f51c3a09-9360-4a08-9e96-1dc5ec2801f8";
const B_GARLIC = "3dd2a909-fa67-4579-8447-2f4f58e7991d";
const B_BAYLEAF = "9252f026-37a7-49f9-a155-785a42058622";
const B_SALT = "b1cb8234-55ef-4572-bb73-a6517a6996a2";
const B_S1 = "6c34d557-7750-4903-92d2-afcd8b042882";
const B_S2 = "e8425774-e503-45b6-a871-d4eb9a591391";
const B_S3 = "396647f7-ab5e-4f12-8230-18d27ebaea61";
const B_S4 = "aecf2fbb-416c-4a30-b8df-361471dbfd0a";
const B_S5 = "79bdf428-4265-4381-99f5-3a009fdb26f9";

// Cottage cheese pancakes — recipe + 6 ingredients + 4 steps
const SY_ID = "d5960a0b-0b2c-46e9-8dd5-e64208efccb5";
const SY_CHEESE = "02c8dbfc-c352-4155-bdd1-bb19ddcbd262";
const SY_EGG = "66fd5dba-20de-45ff-bfac-da3d1e6d438a";
const SY_SUGAR = "72556bf6-6217-46ae-b012-8401c7aae041";
const SY_FLOUR = "70ef6f44-3a56-435b-a345-88f277e7bef7";
const SY_VANILLA = "15fbedf2-b435-49fd-8489-d1a411ae6a39";
const SY_OIL = "97203723-e3e2-4ff3-a1a0-9c238244b5c3";
const SY_S1 = "bcb58521-ed82-485e-b70a-0a20bf2cfa9a";
const SY_S2 = "f4a51d9a-34de-43bd-9aeb-d1afe61de4ec";
const SY_S3 = "836609bd-99e8-4f2d-8df0-a75b993ad0b5";
const SY_S4 = "d25e31e8-9d1c-4400-bf78-a14782365c24";

// Baked salmon — recipe + 9 ingredients + 4 steps
const SA_ID = "73f3014e-fd88-459f-b05d-00fa7b5f06c9";
const SA_SALMON = "77489a2b-459f-4667-948e-d2d1a8983b4e";
const SA_TOMATO = "8e8528f0-e9b4-471f-8f45-bfc964a31026";
const SA_ZUCCH = "aedb93ab-b45a-4100-be74-eb55c1934824";
const SA_LEMON = "9a8bd2fb-83dc-4c7f-b9b4-63b2d05f573a";
const SA_OIL = "8ae7324e-44f6-4a59-9166-8ae69a27843e";
const SA_GARLIC = "6197ff5e-20b2-4eeb-97da-f482b0e2d82f";
const SA_DILL = "54bb8aa6-b81f-4314-83c5-371089d3d19d";
const SA_PAPRIKA = "eb11b801-93a9-434a-96e3-90f7f6811412";
const SA_SALT = "e2d0abb9-4ac2-40d2-8cb4-5562f09520e9";
const SA_S1 = "07b7a191-e49d-4a75-868a-baa9b6041907";
const SA_S2 = "b98a79b0-72c4-4bbc-84dd-b48fcfda56b4";
const SA_S3 = "bfae41c0-95d9-4561-814e-f7ada1741a28";
const SA_S4 = "5ddcd2a8-a7cf-4eca-83db-6a9cc9e84a8b";

// Greek salad — recipe + 7 ingredients + 3 steps
const GS_ID = "a9dc706a-6d2f-429c-997c-ff9198f6ebaf";
const GS_TOMATO = "f2c62c7f-a424-4bd2-af53-c0c000ed951d";
const GS_CUCUMB = "0e809ae6-7df4-4d32-8a31-d4bd350f66ab";
const GS_PEPPER = "8e817d32-bac9-434e-8cbe-530ee287d900";
const GS_ONION = "c274e2c1-75fb-4490-9ed4-e234d377a536";
const GS_FETA = "3c0cf84e-58c0-4d59-b3ee-926fc5e4a471";
const GS_OLIVES = "5ce669ba-73f3-44a0-8c3b-5742ba9d975e";
const GS_OIL = "74d52607-b025-405f-a01f-21822ace10c0";
const GS_S1 = "1e371979-64c9-490f-89d1-8b877f81c17e";
const GS_S2 = "48f01adc-5522-4e96-adda-9484c8b2f2c1";
const GS_S3 = "9510297e-a4be-4fb1-a0c2-53b72388fc86";

// Apple charlotte — recipe + 7 ingredients + 4 steps
const CH_ID = "16afbac4-6afb-4960-9334-40c175b09c02";
const CH_APPLE = "b3ec48d8-4feb-4dd7-b043-a86c1678e913";
const CH_EGG = "bb099f65-acac-42e5-b236-0af2baeeba02";
const CH_SUGAR = "2de1133c-15f5-45e5-b14f-9d00a98c8e8f";
const CH_FLOUR = "2b3d0463-acfe-4c30-85a1-e649fc5d15dd";
const CH_BAKING = "bcc3469d-4aa7-46cd-9c5e-08f7ac3a8703";
const CH_VANILLA = "ef0808bf-c42b-4e4c-9888-5b50a0b93d14";
const CH_SALT = "51d3f31e-1109-4c0f-922d-abdc8e3f768d";
const CH_S1 = "786dece4-9af0-4950-8649-21fce0916264";
const CH_S2 = "40352188-0a6f-4b84-a811-7ccf536a6778";
const CH_S3 = "f4b91849-946c-4f76-8c75-1649e7f16a82";
const CH_S4 = "bb960af4-99ff-4d38-af7b-5d5a7917b776";

// ─── recipe definitions ───────────────────────────────────────────────────────

const RECIPES: RecipeDef[] = [
    {
        id: B_ID,
        title: { en: "Borscht", uk: "Борщ" },
        servings: 6,
        totalMinutes: 140,
        caloriesPerServing: 180,
        tags: ["soup", "meat"],
        favorite: false,
        ingredients: [
            {
                id: B_BEEF,
                name: { en: "Beef on the bone", uk: "Яловичина на кістці" },
                amount: 0.5,
                unit: "kg",
            },
            {
                id: B_WATER,
                name: { en: "Water", uk: "Вода" },
                amount: 2,
                unit: "l",
            },
            {
                id: B_BEET,
                name: { en: "Beetroot", uk: "Буряк" },
                amount: 2,
                unit: "pcs",
            },
            {
                id: B_POTATO,
                name: { en: "Potatoes", uk: "Картопля" },
                amount: 300,
                unit: "g",
            },
            {
                id: B_CABBAGE,
                name: { en: "White cabbage", uk: "Капуста білокачанна" },
                amount: 200,
                unit: "g",
            },
            {
                id: B_CARROT,
                name: { en: "Carrot", uk: "Морква" },
                amount: 1,
                unit: "pcs",
            },
            {
                id: B_ONION,
                name: { en: "Onion", uk: "Цибуля ріпчаста" },
                amount: 1,
                unit: "pcs",
            },
            {
                id: B_TOMPASTE,
                name: { en: "Tomato paste", uk: "Томатна паста" },
                amount: 2,
                unit: "tbsp",
            },
            {
                id: B_OIL,
                name: { en: "Sunflower oil", uk: "Соняшникова олія" },
                amount: 2,
                unit: "tbsp",
            },
            {
                id: B_GARLIC,
                name: { en: "Garlic", uk: "Часник" },
                amount: 3,
                unit: "clove",
            },
            {
                id: B_BAYLEAF,
                name: { en: "Bay leaf", uk: "Лавровий лист" },
                amount: 2,
                unit: "pcs",
            },
            {
                id: B_SALT,
                name: { en: "Salt", uk: "Сіль" },
                unit: "toTaste",
            },
        ],
        steps: [
            {
                id: B_S1,
                text: {
                    en: "Put the beef into a large pot, cover with cold water, and bring to a boil. Skim off any foam, then reduce heat and simmer for 1.5 hours until the meat is tender.",
                    uk: "Покладіть яловичину в каструлю, залийте холодною водою та доведіть до кипіння. Зніміть піну, зменшіть вогонь і варіть 1,5 години, поки м'ясо не стане м'яким.",
                },
                ingredientIds: [B_BEEF, B_WATER],
                timer: { minutes: 90, kind: "boil" },
            },
            {
                id: B_S2,
                text: {
                    en: "Peel and grate the beetroot into thin strips. Remove the beef, shred the meat off the bone, and return it to the broth. Add the beetroot and stew for 20 minutes.",
                    uk: "Очистіть буряк і наріжте соломкою. Дістаньте м'ясо, відокремте від кістки, поверніть у бульйон. Додайте буряк і тушкуйте 20 хвилин.",
                },
                ingredientIds: [B_BEET],
                timer: { minutes: 20, kind: "stew" },
            },
            {
                id: B_S3,
                text: {
                    en: "Dice the potatoes and finely shred the cabbage. Add both to the pot and cook for 15 minutes.",
                    uk: "Поріжте картоплю кубиками, тонко нашаткуйте капусту. Додайте обидва інгредієнти в каструлю та готуйте 15 хвилин.",
                },
                ingredientIds: [B_POTATO, B_CABBAGE],
                timer: { minutes: 15, kind: "stew" },
            },
            {
                id: B_S4,
                text: {
                    en: "Finely dice the carrot and onion and sauté in sunflower oil until golden. Stir in the tomato paste and cook for 2 more minutes, then add to the pot.",
                    uk: "Дрібно наріжте моркву і цибулю, обсмажте на олії до золотистого кольору. Додайте томатну пасту, готуйте ще 2 хвилини, потім перекладіть зажарку в борщ.",
                },
                ingredientIds: [B_CARROT, B_ONION, B_TOMPASTE, B_OIL],
            },
            {
                id: B_S5,
                text: {
                    en: "Add the pressed garlic, bay leaves, and salt to taste. Turn off the heat, cover, and let the borscht rest for 10 minutes before serving.",
                    uk: "Додайте видавлений часник, лавровий лист і посоліть за смаком. Вимкніть вогонь, накрийте кришкою і дайте борщу настоятися 10 хвилин.",
                },
                ingredientIds: [B_GARLIC, B_BAYLEAF, B_SALT],
            },
        ],
    },

    {
        id: SY_ID,
        title: {
            en: "Cottage Cheese Pancakes",
            uk: "Сирники",
        },
        servings: 2,
        totalMinutes: 20,
        caloriesPerServing: 320,
        tags: ["breakfast", "vegetarian"],
        favorite: false,
        ingredients: [
            {
                id: SY_CHEESE,
                name: {
                    en: "Full-fat cottage cheese",
                    uk: "Сир кисломолочний 9%",
                },
                amount: 250,
                unit: "g",
            },
            {
                id: SY_EGG,
                name: { en: "Egg", uk: "Яйце" },
                amount: 1,
                unit: "pcs",
            },
            {
                id: SY_SUGAR,
                name: { en: "Sugar", uk: "Цукор" },
                amount: 1.5,
                unit: "tbsp",
            },
            {
                id: SY_FLOUR,
                name: {
                    en: "All-purpose flour",
                    uk: "Борошно пшеничне",
                },
                amount: 3,
                unit: "tbsp",
            },
            {
                id: SY_VANILLA,
                name: { en: "Vanilla", uk: "Ваніль" },
                amount: 1,
                unit: "pinch",
            },
            {
                id: SY_OIL,
                name: { en: "Vegetable oil", uk: "Олія рослинна" },
                amount: 30,
                unit: "ml",
            },
        ],
        steps: [
            {
                id: SY_S1,
                text: {
                    en: "In a bowl, combine the cottage cheese, egg, sugar, and vanilla. Mix until smooth.",
                    uk: "У мисці змішайте сир, яйце, цукор і ваніль до однорідної консистенції.",
                },
                ingredientIds: [SY_CHEESE, SY_EGG, SY_SUGAR, SY_VANILLA],
            },
            {
                id: SY_S2,
                text: {
                    en: "Add the flour and mix until a soft, slightly sticky dough forms. Dust your hands and shape the mixture into small round patties about 1 cm thick.",
                    uk: "Додайте борошно та замісіть м'яке, злегка липке тісто. Присипте руки борошном і сформуйте невеликі круглі котлетки завтовшки близько 1 см.",
                },
                ingredientIds: [SY_FLOUR],
            },
            {
                id: SY_S3,
                text: {
                    en: "Heat the vegetable oil in a frying pan over medium heat. Fry the syrnyky for 3–4 minutes on each side until golden brown.",
                    uk: "Розігрійте олію на сковорідці на середньому вогні. Смажте сирники по 3–4 хвилини з кожного боку до золотистої скоринки.",
                },
                ingredientIds: [SY_OIL],
                timer: { minutes: 8, kind: "fry" },
            },
            {
                id: SY_S4,
                text: {
                    en: "Serve hot with sour cream, jam, or fresh berries.",
                    uk: "Подавайте гарячими зі сметаною, варенням або свіжими ягодами.",
                },
                ingredientIds: [],
            },
        ],
    },

    {
        id: SA_ID,
        title: {
            en: "Baked Salmon with Vegetables",
            uk: "Запечений лосось з овочами",
        },
        servings: 2,
        totalMinutes: 35,
        caloriesPerServing: 420,
        tags: ["fish", "main"],
        favorite: true,
        ingredients: [
            {
                id: SA_SALMON,
                name: { en: "Salmon fillet", uk: "Філе лосося" },
                amount: 400,
                unit: "g",
            },
            {
                id: SA_TOMATO,
                name: { en: "Cherry tomatoes", uk: "Помідори черрі" },
                amount: 200,
                unit: "g",
            },
            {
                id: SA_ZUCCH,
                name: { en: "Zucchini", uk: "Кабачок" },
                amount: 1,
                unit: "pcs",
            },
            {
                id: SA_LEMON,
                name: { en: "Lemon", uk: "Лимон" },
                amount: 1,
                unit: "pcs",
            },
            {
                id: SA_OIL,
                name: { en: "Olive oil", uk: "Оливкова олія" },
                amount: 2,
                unit: "tbsp",
            },
            {
                id: SA_GARLIC,
                name: { en: "Garlic", uk: "Часник" },
                amount: 2,
                unit: "clove",
            },
            {
                id: SA_DILL,
                name: { en: "Fresh dill", uk: "Кріп свіжий" },
                amount: 1,
                unit: "bunch",
            },
            {
                id: SA_PAPRIKA,
                name: { en: "Smoked paprika", uk: "Копчена паприка" },
                amount: 0.5,
                unit: "tsp",
            },
            {
                id: SA_SALT,
                name: { en: "Salt", uk: "Сіль" },
                unit: "toTaste",
            },
        ],
        steps: [
            {
                id: SA_S1,
                text: {
                    en: "Preheat the oven to 200 °C. Slice the zucchini into half-moons, halve the cherry tomatoes, mince the garlic, and slice the lemon into thin rounds.",
                    uk: "Розігрійте духовку до 200 °C. Наріжте кабачок півкільцями, помідори розріжте навпіл, часник подрібніть, лимон наріжте тонкими кружечками.",
                },
                ingredientIds: [SA_ZUCCH, SA_TOMATO, SA_GARLIC, SA_LEMON],
            },
            {
                id: SA_S2,
                text: {
                    en: "Toss the vegetables with olive oil, smoked paprika, and salt. Spread in a single layer on a baking tray.",
                    uk: "Змішайте овочі з оливковою олією, копченою паприкою і сіллю. Розкладіть рівним шаром на деку.",
                },
                ingredientIds: [
                    SA_TOMATO,
                    SA_ZUCCH,
                    SA_OIL,
                    SA_PAPRIKA,
                    SA_SALT,
                ],
            },
            {
                id: SA_S3,
                text: {
                    en: "Place the salmon fillets on top of the vegetables. Drizzle with the remaining olive oil, season with salt, and lay the lemon slices over the fish.",
                    uk: "Покладіть філе лосося поверх овочів. Полийте рештою оливкової олії, посоліть і накладіть зверху кружечки лимону.",
                },
                ingredientIds: [SA_SALMON, SA_OIL, SA_SALT, SA_LEMON],
            },
            {
                id: SA_S4,
                text: {
                    en: "Bake for 20 minutes until the salmon flakes easily with a fork. Scatter fresh dill over the top before serving.",
                    uk: "Запікайте 20 хвилин, поки риба легко розшаровується виделкою. Перед подачею посипте свіжим кропом.",
                },
                ingredientIds: [SA_DILL],
                timer: { minutes: 20, kind: "bake" },
            },
        ],
    },

    {
        id: GS_ID,
        title: { en: "Greek Salad", uk: "Грецький салат" },
        servings: 2,
        tags: ["salad", "vegetarian"],
        favorite: false,
        ingredients: [
            {
                id: GS_TOMATO,
                name: { en: "Tomatoes", uk: "Помідори" },
                amount: 2,
                unit: "pcs",
            },
            {
                id: GS_CUCUMB,
                name: { en: "Cucumber", uk: "Огірок" },
                amount: 1,
                unit: "pcs",
            },
            {
                id: GS_PEPPER,
                name: {
                    en: "Red bell pepper",
                    uk: "Болгарський перець червоний",
                },
                amount: 1,
                unit: "pcs",
            },
            {
                id: GS_ONION,
                name: { en: "Red onion", uk: "Червона цибуля" },
                amount: 0.5,
                unit: "pcs",
            },
            {
                id: GS_FETA,
                name: { en: "Feta cheese", uk: "Сир фета" },
                amount: 100,
                unit: "g",
            },
            {
                id: GS_OLIVES,
                name: {
                    en: "Kalamata olives",
                    uk: "Оливки Каламата",
                },
                amount: 60,
                unit: "g",
            },
            {
                id: GS_OIL,
                name: { en: "Olive oil", uk: "Оливкова олія" },
                amount: 3,
                unit: "tbsp",
            },
        ],
        steps: [
            {
                id: GS_S1,
                text: {
                    en: "Cut the tomatoes, cucumber, and red bell pepper into bite-size chunks. Thinly slice the red onion.",
                    uk: "Поріжте помідори, огірок і болгарський перець великими шматочками. Тонко наріжте червону цибулю.",
                },
                ingredientIds: [GS_TOMATO, GS_CUCUMB, GS_PEPPER, GS_ONION],
            },
            {
                id: GS_S2,
                text: {
                    en: "Combine all the vegetables in a salad bowl. Add the olives and crumble the feta on top.",
                    uk: "Змішайте овочі у салатниці. Додайте оливки та накришіть зверху фету.",
                },
                ingredientIds: [GS_FETA, GS_OLIVES],
            },
            {
                id: GS_S3,
                text: {
                    en: "Drizzle with olive oil and toss gently. Season with extra salt if needed and serve immediately.",
                    uk: "Полийте оливковою олією та обережно перемішайте. За потреби підсоліть і подавайте відразу.",
                },
                ingredientIds: [GS_OIL],
            },
        ],
    },

    {
        id: CH_ID,
        title: { en: "Apple Charlotte", uk: "Шарлотка" },
        servings: 8,
        totalMinutes: 60,
        caloriesPerServing: 290,
        tags: ["dessert", "baking"],
        favorite: false,
        ingredients: [
            {
                id: CH_APPLE,
                name: { en: "Apples", uk: "Яблука" },
                amount: 3,
                unit: "pcs",
            },
            {
                id: CH_EGG,
                name: { en: "Eggs", uk: "Яйця" },
                amount: 3,
                unit: "pcs",
            },
            {
                id: CH_SUGAR,
                name: { en: "Sugar", uk: "Цукор" },
                amount: 1,
                unit: "cup",
            },
            {
                id: CH_FLOUR,
                name: {
                    en: "All-purpose flour",
                    uk: "Борошно пшеничне",
                },
                amount: 1.5,
                unit: "cup",
            },
            {
                id: CH_BAKING,
                name: { en: "Baking powder", uk: "Розпушувач тіста" },
                amount: 1,
                unit: "tsp",
            },
            {
                id: CH_VANILLA,
                name: {
                    en: "Vanilla extract",
                    uk: "Ванільний екстракт",
                },
                amount: 1,
                unit: "tsp",
            },
            {
                id: CH_SALT,
                name: { en: "Salt", uk: "Сіль" },
                amount: 1,
                unit: "pinch",
            },
        ],
        steps: [
            {
                id: CH_S1,
                text: {
                    en: "Peel and core the apples, then slice them thinly. Preheat the oven to 180 °C and grease a 24 cm round baking tin.",
                    uk: "Очистіть яблука від шкірки та серцевини, наріжте тонкими скибочками. Розігрійте духовку до 180 °C, змастіть форму для випічки діаметром 24 см.",
                },
                ingredientIds: [CH_APPLE],
            },
            {
                id: CH_S2,
                text: {
                    en: "Beat the eggs with the sugar using a mixer or whisk until the mixture is light and fluffy, about 5 minutes.",
                    uk: "Збийте яйця з цукром міксером або вінчиком до пишної, світлої маси, близько 5 хвилин.",
                },
                ingredientIds: [CH_EGG, CH_SUGAR],
            },
            {
                id: CH_S3,
                text: {
                    en: "Sift in the flour, baking powder, vanilla extract, and salt. Fold gently until just combined — do not overmix. Pour the batter into the prepared tin and arrange the apple slices on top.",
                    uk: "Просійте борошно з розпушувачем, ванільним екстрактом і сіллю. Акуратно вмішайте до однорідності — не перемішуйте надто довго. Вилийте тісто у форму, зверху красиво викладіть скибочки яблук.",
                },
                ingredientIds: [
                    CH_FLOUR,
                    CH_BAKING,
                    CH_VANILLA,
                    CH_SALT,
                    CH_APPLE,
                ],
            },
            {
                id: CH_S4,
                text: {
                    en: "Bake for 40 minutes until golden and a toothpick inserted in the centre comes out clean. Cool in the tin for 10 minutes before turning out.",
                    uk: "Випікайте 40 хвилин до золотистого кольору. Готовність перевірте зубочисткою: вона має виходити сухою. Охолодіть у формі 10 хвилин, потім виймайте.",
                },
                ingredientIds: [],
                timer: { minutes: 40, kind: "bake" },
            },
        ],
    },
];

// ─── builder ─────────────────────────────────────────────────────────────────

function buildRecipes(
    defs: RecipeDef[],
    language: AppLanguage,
    now: string,
): Recipe[] {
    return defs.map((def) => ({
        id: def.id,
        title: def.title[language],
        servings: def.servings,
        totalMinutes: def.totalMinutes,
        caloriesPerServing: def.caloriesPerServing,
        tags: def.tags,
        favorite: def.favorite,
        ingredients: def.ingredients.map((i) => ({
            id: i.id,
            name: i.name[language],
            amount: i.amount,
            unit: i.unit,
        })),
        steps: def.steps.map((s) => ({
            id: s.id,
            text: s.text[language],
            ingredientIds: s.ingredientIds,
            timer: s.timer,
        })),
        createdAt: now,
        updatedAt: now,
    }));
}

export function getDemoRecipes(language: AppLanguage, now: Date): Recipe[] {
    return buildRecipes(RECIPES, language, now.toISOString());
}
